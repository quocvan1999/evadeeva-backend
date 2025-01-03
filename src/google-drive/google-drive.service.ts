import { BadRequestException, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private oAuth2Client;
  private drive;

  constructor() {
    const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
    const { client_id, client_secret, redirect_uris } = credentials.web;

    this.oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));
    this.oAuth2Client.setCredentials(token);

    this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
  }

  private async getOrCreateFolder(
    folderName: string,
    parentId: string,
  ): Promise<string> {
    // Kiểm tra xem thư mục đã tồn tại chưa
    const res = await this.drive.files.list({
      q: `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    if (res.data.files && res.data.files.length > 0) {
      // Nếu thư mục đã tồn tại, trả về ID
      return res.data.files[0].id;
    }

    // Nếu chưa tồn tại, tạo mới
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const folder = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }

  private async getOrCreateRootFolder(): Promise<string> {
    // Kiểm tra xem thư mục tổng có tồn tại chưa
    const res = await this.drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and name = 'EVADEEVA' and trashed = false",
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    let rootFolderId = res.data.files[0]?.id;

    if (!rootFolderId) {
      // Nếu thư mục tổng chưa có, tạo mới
      rootFolderId = await this.getOrCreateFolder('EVADEEVA', 'root');
    }

    return rootFolderId;
  }

  validateFile(
    file: Express.Multer.File,
    allowedTypes: string[],
    maxSize: number,
  ) {
    // Kiểm tra loại file
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Chỉ hỗ trợ file có định dạng ${allowedTypes}.`,
      );
    }

    // Kiểm tra kích thước file
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Chỉ hỗ trợ file có dung lượng dưói ${maxSize / 1024 / 1024} MB.`,
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    apiName: string,
    allowedTypes: string[],
    maxSize: number,
  ): Promise<string> {
    this.validateFile(file, allowedTypes, maxSize);

    // Lấy hoặc tạo thư mục tổng
    const rootFolderId = await this.getOrCreateRootFolder();

    // Lấy hoặc tạo thư mục riêng cho API
    const apiFolderId = await this.getOrCreateFolder(apiName, rootFolderId);

    const isDate = new Date().toISOString();

    const fileMetadata = {
      name: `${isDate}_${file.originalname}`,
      parents: [apiFolderId], // Đặt file vào thư mục của API
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer), // Chuyển buffer thành stream
    };

    try {
      // Upload file
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      const fileId = response.data.id;

      // Lấy link chia sẻ của file
      const fileDetails = await this.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink',
      });

      return fileDetails.data.webViewLink; // Trả về link để sử dụng
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Trích xuất ID từ URL
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!match || !match[1]) {
        throw new Error('URL tệp Google Drive không hợp lệ');
      }
      const fileId = match[1];

      // Lấy thông tin file để kiểm tra loại tài nguyên
      const fileDetails = await this.drive.files.get({
        fileId: fileId,
        fields: 'mimeType',
      });

      // Kiểm tra nếu tài nguyên là file
      if (fileDetails.data.mimeType === 'application/vnd.google-apps.folder') {
        throw new Error(
          'URL được cung cấp là một thư mục, không phải một tập tin.',
        );
      }

      // Xóa file
      await this.drive.files.delete({ fileId: fileId });
      console.log(`Tệp có ID "${fileId}" đã được xóa thành công.`);
    } catch (error) {
      console.error('Lỗi xóa tập tin:', error.message);
      throw error;
    }
  }
}

import { Body, Controller, Delete, Get, HttpCode, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { CarHistoryService } from "./car-history.service";
import { ApiCreatedResponse, ApiQuery } from "@nestjs/swagger";
import { ImageResultDto } from "./dtos/plate-reg-web-hook.dto";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";


@Controller("car-history")
export class CarHistoryController {
	constructor(
		private readonly carHistoryService: CarHistoryService,
	) {}

	@Get("/:plateNumber")
	@ApiQuery({ name: "plateNumber", required: true, type: String })
	async getHistoryByPlateNumber(@Query("plateNumber") plateNumber: string) {
		return this.carHistoryService.findByPlateNumber(plateNumber);
	}

	@Get("/:id")
	@ApiQuery({ name: "id", required: true, type: String })
	async getHistoryById(@Query("id") id: string) {
		return this.carHistoryService.findById(id);
	}

	@Get("/")
	async getAllHistories() {
		return this.carHistoryService.getListHistories();
	}

	@Post('/hook/plate-recognition')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, file.originalname),
      }),
    }),
  )
  @HttpCode(200)
  async uploadEntryCamResult(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('json') jsonString: string,
  ) {
    // Xử lý JSON payload
    if (!jsonString) {
      return { success: false, message: 'Missing JSON payload' };
    }

    let payload;
    try {
      payload = JSON.parse(jsonString);
    } catch (e) {
      return { success: false, message: 'Invalid JSON' };
    }

    const results = payload.data?.results || null;
    const timestamp = payload.data?.timestamp || null;
    const cameraId = payload.data?.camera_id || null;

    // Lặp qua tất cả file
    for (const file of files) {
      console.log('Received file:', file.originalname, file.path);
      await this.carHistoryService.handlePlateRecognitionHook(
        file.path,
        timestamp,
        cameraId,
        results,
      );
    }

    return { success: true, fileCount: files.length };
  }

  @Delete("/:id")
  @ApiQuery({ name: "id", required: true, type: String })
  async deleteHistoryById(@Query("id") id: string) {
	return this.carHistoryService.deleteById(id);
  }
}
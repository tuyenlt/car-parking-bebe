import { Body, Controller, Delete, Get, HttpCode, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { CarHistoryService } from "./car-history.service";
import { ApiCreatedResponse, ApiQuery } from "@nestjs/swagger";
import { ImageResultDto } from "./dtos/plate-reg-web-hook.dto";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { JWTGuard } from "src/common/guards/jwt.guard";
import { RoleGuard } from "src/common/guards/role.guard";
import { APP_ROLE } from "src/common/constants/common.constant";
import { ApiKeyGuard } from "src/common/guards/api-key.guard";


@Controller("car-history")
export class CarHistoryController {
	constructor(
		private readonly carHistoryService: CarHistoryService,
	) {}

	
	@Get("/")
	@UseGuards(JWTGuard, new RoleGuard([APP_ROLE.ADMIN]))
	async getAllHistories() {
		return this.carHistoryService.getListHistories();
	}

	@Delete("/:id")
	@UseGuards(JWTGuard)
	@ApiQuery({ name: "id", required: true, type: String })
	async deleteHistoryById(@Param("id") id: string) {
		return this.carHistoryService.deleteById(id);
	}

	@Get("/:id")
	@UseGuards(JWTGuard)
	@ApiQuery({ name: "id", required: true, type: String })
	async getHistoryById(@Param("id") id: string) {
		return this.carHistoryService.findById(id);
	}
	
	@Get("/by-plate/:plateNumber")
	@UseGuards(JWTGuard)
	@ApiQuery({ name: "plateNumber", required: true, type: String })
	async getHistoryByPlateNumber(@Param("plateNumber") plateNumber: string) {
		console.log("Plate Number:", plateNumber);
		return await this.carHistoryService.getCarHistoryByPlateNumber(plateNumber);
	}
	
	@Post('/hook/plate-recognition')
	@UseGuards(ApiKeyGuard)
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

}
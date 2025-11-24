import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { CarHistoryService } from "./car-history.service";
import { ApiQuery } from "@nestjs/swagger";
import { ImageResultDto } from "./dtos/plate-reg-web-hook.dto";
import { FileInterceptor } from "@nestjs/platform-express";
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

	@Post('upload')
	@UseInterceptors(
    FileInterceptor('input', {
      storage: diskStorage({
			destination: './uploads',
			filename: (req, file, cb) => {
			cb(null, file.originalname);
			},
		}),
	  }),
  	)
	async uploadEntryCamResult(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: any,
	) {
		let results = null;
		if(body.results){
			results = JSON.parse(body.results);
		}
		return this.carHistoryService.handlePlateRecognitionHook(
			file?.path,
			body.timestamp,
			body.camera_id,
			results,
		);

	}
}
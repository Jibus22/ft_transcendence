import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportsService } from './reports.service'
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/users.entity';
import { ReportDto } from './dtos/report.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ApprovedReportDto } from './dtos/approve-report.dto';
import { AdminGuard } from '../guards/admin.guard';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Controller('reports')
export class ReportsController {

	constructor( private reportsService: ReportsService) {}

	@Post()
	@Serialize(ReportDto)
	@UseGuards(AuthGuard)
	createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
		return this.reportsService.create(body, user);
	}

	@Patch('/:id')
	@UseGuards(AdminGuard)
	approveReport(@Param('id') id: string, @Body() body: ApprovedReportDto) {
		return this.reportsService.changeApproval(id, body.approved);
	}

	@Get()
	@UseGuards(AuthGuard)
	getEstimate(@Query() query: GetEstimateDto) {
		return this.reportsService.createEstimate(query);
	}


}

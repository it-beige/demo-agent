import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { JobService } from './job/job.service';

@Controller()
export class AppController {
  @Inject(JobService)
  private readonly jobService: JobService;

  // 根路由已移除，由 ServeStaticModule 提供静态文件服务（public/index.html）

  @Get('api/jobs')
  async getJobs() {
    const jobs = await this.jobService.listJobs();
    return { jobs };
  }

  @Post('api/jobs/:id/toggle')
  async toggleJob(
    @Param('id') id: string,
    @Body() body: { isEnabled?: boolean },
  ) {
    const job = await this.jobService.toggleJob(id, body?.isEnabled);
    return { job };
  }

  @Delete('api/jobs/:id')
  async deleteJob(@Param('id') id: string) {
    return this.jobService.deleteJob(id);
  }
}

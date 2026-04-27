import { Controller, Get, Inject } from '@nestjs/common';
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
}

import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobAgentService } from './job-agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { ToolModule } from '../tool/tool.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), ToolModule],
  providers: [JobService, JobAgentService],
  exports: [JobService, JobAgentService],
})
export class JobModule {}

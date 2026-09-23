import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * 用户管理的确定性 REST 接口。
 * 前端表格直接走这里，不再绕 AI 对话 + 正则解析自然语言，既快又稳。
 */
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; email: string; role?: string }) {
    return this.usersService.create(body.name, body.email, body.role);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(Number(id));
    return { id: Number(id), deleted: true };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  @Inject(EntityManager)
  entityManager: EntityManager;

  create(name: string, email: string, role: string = 'user') {
    return this.entityManager.save(User, { name, email, role });
  }

  findAll() {
    return this.entityManager.find(User);
  }

  findOne(id: number) {
    return this.entityManager.findOne(User, { where: { id } });
  }

  update(id: number, name?: string, email?: string, role?: string) {
    return this.entityManager.update(User, id, { name, email, role });
  }

  remove(id: number) {
    return this.entityManager.delete(User, id);
  }
}

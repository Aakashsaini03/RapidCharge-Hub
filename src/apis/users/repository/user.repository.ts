import { User } from 'src/apis/users/entities/users.entity';
import { Repository } from 'typeorm';

export class UserRepository extends Repository<User> {}

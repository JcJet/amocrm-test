import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity(`tokens`)
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric' })
  userId: number;

  @Column({ type: 'varchar' })
  refreshToken: string;

  @Column({ type: 'varchar' })
  accessToken: string;

  //Время жизни Access Token, в секундах
  @Column({ type: 'numeric' })
  expiresIn: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from "typeorm";
import { randomUUID } from "crypto";

export class BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @CreateDateColumn({ type: "datetime", nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: "datetime", nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at?: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
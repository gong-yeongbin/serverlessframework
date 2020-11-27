import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Location, Image, PostNormal, PostBusiness } from "../entity/Entity";

@Entity("post")
export default class Post {
  @PrimaryGeneratedColumn({ name: "id", type: "bigint" })
  id: number;

  @Column({ name: "post_id", type: "nvarchar" })
  postId: string;

  @Column({ name: "title", type: "nvarchar", length: 30 })
  title: string;

  @Column({ name: "view", type: "integer", default: 0 })
  view: number;

  @Column({ name: "number", type: "integer", nullable: true })
  number: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => PostBusiness)
  @JoinColumn({ name: "business" })
  business: PostBusiness;

  @OneToOne(() => Location)
  postLocation: Location;

  // @OneToOne(() => PostNormal, (postNormal) => postNormal.post, {
  //   cascade: ["insert", "update", "remove"],
  // })
  // normal: PostNormal;

  // @OneToOne(() => PostBusiness, {
  //   cascade: ["insert", "update", "remove"],
  // })
  // @JoinColumn({ name: "id" })
  // business: PostBusiness;

  @OneToMany(() => Image, (image) => image.post, {
    cascade: ["insert", "update", "remove"],
  })
  postImage: Image[];

  // @OneToOne(() => Location, {
  //   cascade: ["insert", "update", "remove"],
  // })
  // @JoinColumn({ name: "id" })
  // location: Location;

  @Column({ name: "hide", type: "boolean", default: false })
  hide: boolean;
}

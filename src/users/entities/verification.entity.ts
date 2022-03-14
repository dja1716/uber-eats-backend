import { CoreEntity } from './../../common/entities/core.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";

@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
    @Column()
    @Field(type => String)
    code: string;
}
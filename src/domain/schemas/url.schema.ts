import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {Document} from "mongoose";
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class Url extends Document {
    @ApiProperty()
    @Prop({ type: String, unique: true, required: true })
    shortCode: string;

    @ApiProperty()
    @Prop({ type: String, required: true })
    longUrl: string;

    @ApiProperty()
    @Prop({ type: Number, required: true, default: 0 })
    handleClicksCounter: number;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
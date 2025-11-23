import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type PostItem = {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  image?: string;
  date?: string;
  type?: string;
};

type PostDocument = PostItem & { _id: any };

@Injectable()
export class PostsService {
  constructor(@InjectModel('Post') private readonly postModel: Model<PostDocument>) {}

  async findAll(): Promise<PostItem[]> {
    const docs = await this.postModel.find().sort({ id: 1 }).lean().exec();
    return docs.map((d) => ({ id: d.id, title: d.title, excerpt: d.excerpt, content: d.content, image: d.image, date: d.date, type: d.type }));
  }

  async findOne(id: number): Promise<PostItem> {
    const post = await this.postModel.findOne({ id }).lean().exec();
    if (!post) throw new NotFoundException('Post not found');
    return { id: post.id, title: post.title, excerpt: post.excerpt, content: post.content, image: post.image, date: post.date, type: post.type };
  }

  async create(payload: Omit<PostItem, 'id'>): Promise<PostItem> {
    // compute next numeric id
    const last = await this.postModel.findOne().sort({ id: -1 }).lean().exec();
    const nextId = last ? last.id + 1 : 1;
    const created = await this.postModel.create({ id: nextId, ...payload });
    return { id: created.id, title: created.title, excerpt: created.excerpt, content: created.content, image: created.image, date: created.date, type: created.type };
  }

  async update(id: number, payload: Partial<PostItem>): Promise<PostItem> {
    if (Number.isNaN(id)) throw new NotFoundException('Invalid id');
    const updated = await this.postModel.findOneAndUpdate({ id }, { $set: payload }, { new: true }).lean().exec();
    if (!updated) throw new NotFoundException('Post not found');
    return { id: updated.id, title: updated.title, excerpt: updated.excerpt, content: updated.content, image: updated.image, date: updated.date, type: updated.type };
  }

  async remove(id: number): Promise<void> {
    const res = await this.postModel.findOneAndDelete({ id }).lean().exec();
    if (!res) throw new NotFoundException('Post not found');
  }
}

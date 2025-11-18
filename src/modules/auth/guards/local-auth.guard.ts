
import { ExecutionContext, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";


@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    constructor() {
        super();
        console.log('✅ LocalAuthGuard initialized')
    }
}
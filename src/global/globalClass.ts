export class ResponseData<D> {
    data: D | D[] | null;
    message: string;
    statusCode: number;

    constructor(data: D | D[] | null, message: string, statusCode: number) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;

        return this;
    }
}

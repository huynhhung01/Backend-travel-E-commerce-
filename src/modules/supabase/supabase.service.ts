import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            //   process.env.SUPABASE_URL as string,
            "",
            //   process.env.SUPABASE_KEY as string
            ""
        );
    }

    async uploadImage(file: Express.Multer.File, bucket: string, path: string): Promise<string> {
        const { data, error } = await this.supabase.storage.from(bucket).upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            console.log(error);
            throw error;
        }
        // Lấy public URL
        const { publicUrl } = this.supabase.storage.from(bucket).getPublicUrl(path).data;
        return publicUrl;
    }
}

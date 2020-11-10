export interface Asset {
  readonly id: string;
  readonly proof_hash: string;
  readonly owner: string;
  readonly asset_file: string;
  readonly asset_file_thumbnail: string;
  readonly meta: string;
  readonly signature: string;
  readonly caption: string;
  readonly uploaded_at: string;
}

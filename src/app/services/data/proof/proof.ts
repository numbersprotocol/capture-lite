import { MimeType } from '../../../utils/mime-type';

export interface Proof {
  readonly hash: string;
  readonly mimeType: MimeType;
  readonly timestamp: number;
}

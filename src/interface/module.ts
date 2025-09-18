export interface IModule {
  title: string;
  description: string;
  id: number;
  created_at: string;
  image: string;
  video: string;
  video_time: number;
  skills?: Array<{ id: number; title: string }>;
}

export interface IModuleView {
  title: string;
  description: string;
  id: number;
  created_at: string;
  image: string;
  video: string;
  video_time: number;
  skills?: string[];
  image_link: string;
  video_link: string;
}

export interface IMODULEPAYLOAD {
  title: string;
  description: string;
  image: string;
  video: string;
  video_time: number;
}

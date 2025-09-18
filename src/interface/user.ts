export interface IUSER {
  email: string;
  password: string;
}

export interface IFORGOT_PASSWORD {
  email: string;
}

export interface IRESET_PASSWORD {
  password: string;
}
export interface IJWTPayload {
	id: string;
	username: string;
	role: string;
	plate_number?: string;
}

export interface IUserM {
	id: string;
	username: string;
	role: string;
	plate_number?: string;
}
// types/auth.ts
export type LoginPayload = {
    username: string
    password: string
}

export type LoginResponse = {
    token: string
    user?: {
        id: string | number
        name: string
    }
}

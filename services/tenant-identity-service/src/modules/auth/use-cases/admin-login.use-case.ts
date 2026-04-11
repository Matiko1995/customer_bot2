import type { AdminLoginRequest, AdminLoginResponse } from '../../../../../../packages/contracts/src/tenant/auth.contract'

export class AdminLoginUseCase {
  private readonly validateCredentials: (email: string, password: string) => boolean

  constructor(validateCredentials: (email: string, password: string) => boolean) {
    this.validateCredentials = validateCredentials
  }

  execute(input: AdminLoginRequest): AdminLoginResponse {
    if (!this.validateCredentials(input.email.trim(), input.password)) {
      throw new Error('Invalid credentials')
    }

    return {
      ok: true
    }
  }
}

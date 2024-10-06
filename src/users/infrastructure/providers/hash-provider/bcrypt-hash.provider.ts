import { HashProvider } from '@/shared/application/providers/hash-provider'
import { hash, compare } from 'bcryptjs'

export class BcryptHashProvider implements HashProvider {
  constructor(private salt: number = 6) {}

  async generateHash(payload: string): Promise<string> {
    return hash(payload, this.salt)
  }

  async compareHash(payload: string, hash: string): Promise<boolean> {
    return compare(payload, hash)
  }
}

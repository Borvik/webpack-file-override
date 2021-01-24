import { Resolver } from 'enhanced-resolve';
export { Resolver, };
export interface ResolverPlugin {
    apply: (resolver?: Resolver) => void;
}

//@ts-ignore
import home from './home.html';

export interface Env {
	COUNTER: DurableObjectNamespace;
}

/** A Durable Object's behavior is defined in an exported Javascript class */

export class CounterObject {
	// counter: number;
	state: DurableObjectState;
	constructor(state: DurableObjectState, env: Env) {
		// this.counter = 0;
		this.state = state;
	}
	async getCounter() {
		const counter: string | undefined = await this.state.storage.get('counter');
		if (!counter) return 0;
		return parseInt(counter);
	}
	async fetch(request: Request): Promise<Response> {
		const { pathname } = new URL(request.url);
		switch (pathname) {
			case '/': {
				// return new Response(home, { headers: { 'Content-Type': 'text/html;utf=8' } });
				return new Response((await this.getCounter()).toString());
			}
			case '/+': {
				// this.counter++;
				return new Response((await this.getCounter()).toString());
			}
			default: {
				return new Response('error');
			}
		}
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// We will create a `DurableObjectId` using the pathname from the Worker request
		// This id refers to a unique instance of our 'MyDurableObject' class above

		const id: DurableObjectId = env.COUNTER.idFromName('counter');
		const stub: DurableObjectStub = env.COUNTER.get(id);
		// let id: DurableObjectId = env.COUNTER.idFromName(new URL(request.url).pathname);

		// This stub creates a communication channel with the Durable Object instance
		// The Durable Object constructor will be invoked upon the first call for a given id
		// let stub: DurableObjectStub = env.COUNTER.get(id);

		// We call `fetch()` on the stub to send a request to the Durable Object instance
		// The Durable Object instance will invoke its fetch handler to handle the request
		const response = stub.fetch(request);

		return response;
	},
};

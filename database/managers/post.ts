import type { ModelCtor, FindAndCountOptions } from "%/types/dependent"
import type { CommonConstraints, Pipe } from "$/types/database"

import Post from "%/models/post"
import BaseManager from "%/managers/base"
import PostTransformer from "%/transformers/post"

// export default class PostManager extends BaseManager<Post, RawPost> {
// 	get model(): ModelCtor<Post> { return Post }

// 	get transformer(): PostTransformer { return new PostTransformer() }

//     get listPipeline(): Pipe<FindAndCountOptions<Post>, CommonConstraints>[] {
// 		return [
// 			searchName,
// 			...super.listPipeline
// 		]
// 	}
// }

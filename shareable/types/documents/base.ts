import type { UnitError } from "$/types/server"
import type { GeneralObject, Serializable } from "$/types/general"

export type PrimaryData = Serializable

export interface ResourceIdentifier<T extends string|number = string> extends PrimaryData {
	type: string,
	id: T
}

export type Attributes = GeneralObject

export type Resource<
	T extends string|number,
	U extends ResourceIdentifier<T>,
	V extends Attributes> = U & {
	attributes: V
}

type RelationshipData<T extends ResourceIdentifier|ResourceIdentifier[]> = [ string, T ]

export interface Relationships<
	T extends boolean,
	U extends RelationshipData<any>[]
> extends Serializable {
	relationships: T extends false ? undefined : {
		[Property in U[number][0]]: {
			data: U[number][1]
		}
	}
}

export type DeserializedResource<
	T extends string|number,
	U extends ResourceIdentifier<T>,
	V extends Attributes,
> =
	& U
	& V

export interface DataDocument<T extends PrimaryData|PrimaryData[]> extends Serializable {
	data: T
}

export interface MetaDocument<T extends Serializable> extends Serializable {
	meta: T
}

export interface ResourceCount extends Serializable {
	count: number
}

export type ResourceDocument<
	T extends string|number,
	U extends ResourceIdentifier<T>,
	V extends Attributes,
	W extends Resource<T, U, V>
> = DataDocument<W>

export type RawResourceDocument<
	T extends string | number,
	U extends ResourceIdentifier<T>,
	V extends Attributes,
	W extends Resource<T, U, V>
> = DataDocument<Pick<W, "type" | "attributes" | "relationships" | "links" | "meta">>

export interface ResourceListDocument<
	T extends string | number,
	U extends ResourceIdentifier<T>,
	V extends Attributes,
	W extends Resource<T, U, V>
> extends DataDocument<W[]>, Partial<MetaDocument<ResourceCount>> {}

export type DeserializedResourceDocument<
	T extends string|number,
	U extends ResourceIdentifier<T>,
	V extends Attributes,
	W extends DeserializedResource<T, U, V>
> = DataDocument<W>

export interface DeserializedResourceListDocument<
	T extends string|number,
	U extends ResourceIdentifier<T>,
	V extends Attributes,
	W extends DeserializedResource<T, U, V>
> extends DataDocument<W[]>, Partial<MetaDocument<ResourceCount>> {}

export type IdentifierDocument<T extends string|number, U extends ResourceIdentifier<T>>
= DataDocument<U>

export type IdentifierListDocument<T extends string|number, U extends ResourceIdentifier<T>>
= DataDocument<U[]>

export interface ErrorDocument {
	errors: UnitError[]
}

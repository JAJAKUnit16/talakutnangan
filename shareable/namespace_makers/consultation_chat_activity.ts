import specializePath from "$/helpers/specialize_path"

export default function(consultationID: string): string {
	return specializePath("/consultation/:consultationID/chat_activity", {
		consultationID
	})
}

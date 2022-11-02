import convertToRawFullTime from "$/consultation/convert_to_raw_full_time"

export default function(timeInMilliseconds: number): string {
	const {
		hourString,
		minuteString,
		secondString
	} = convertToRawFullTime(timeInMilliseconds)

	return `${hourString} ${minuteString} ${secondString}`
}

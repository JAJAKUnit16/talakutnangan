import Transport from "!/helpers/email/transport";
import RequestEnvironment from "!/helpers/request_environment"
import CommonMiddlewareList from "!/middlewares/common_middleware_list";

export default function() {
	if (
		process.env.EMAIL_HOST !== undefined
		&& process.env.EMAIL_PORT !== undefined
		&& process.env.EMAIL_USER !== undefined
		&& process.env.EMAIL_PASS !== undefined
	) {
		Transport.initialize(
			process.env.EMAIL_HOST,
			+process.env.EMAIL_PORT,
			process.env.EMAIL_USER,
			process.env.EMAIL_PASS
		)
		CommonMiddlewareList.initialize()
	} else {
		if (!RequestEnvironment.isOnTest) {
			console.error("Some e-mail variables are not defined");
			process.exit(1)
		}
	}

}

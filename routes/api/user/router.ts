import GetList from "!%/api/user/list.get"
import GetRead from "!%/api/user/read(id).get"
import PostLogIn from "!%/api/user/log_in.post"
import GetLogIn from "!%/api/user/log_in/image.get"
import PostImport from "!%/api/user/import.post"
import PostLogOut from "!%/api/user/log_out.post"
import PatchRestore from "!%/api/user/restore.patch"
import ArchiveDelete from "!%/api/user/archive.delete"
import PatchUpdate from "!%/api/user/update(id).patch"
import PatchResetPassword from "!%/api/user/reset_password(id).patch"

export const controllers = [
	GetList,
	GetLogIn,
	GetRead,
	PostLogIn,
	PostImport,
	PostLogOut,
	PatchUpdate,
	PatchRestore,
	ArchiveDelete,
	PatchResetPassword
]

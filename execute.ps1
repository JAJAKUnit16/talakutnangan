<#
.SYNOPSIS
Custom commands for the project

.DESCRIPTION
Executes custom ommands for ease of use

.PARAMETER Help
Outputs the detailed help info of the command

.PARAMETER Examples
Only works if `-Help` switch is on.
Includes examples in the help info.

.PARAMETER Server
Starts the development server if other flags passed and restarts if there are file changes.

.PARAMETER Normal
Works only if `-Server` is on.
Starts the server normally.

.PARAMETER Prod
Works only if `-Server` is on.
Starts the server for production purposes.

.PARAMETER Routes
Works only if `-Server` is on.
Lists the routes available in the server.

.PARAMETER Push
Pushes the current branch to remote.

.PARAMETER Pull
Pulls the all branches from remote and prunes remotely-deleted branches.

.PARAMETER Remote
Only works if one of `-Push` or `-Pull` switches is on.
Specifies which remote to push or pull.

.PARAMETER Test
Switch to runs tests.

.PARAMETER SuiteName
Only required if `-Test` switch is on.
It contains the name of test suite to run.

.PARAMETER Path
Only works if `-Test` switch is on.
Limits the files to test base from regular expression.

.PARAMETER Clear
Only works if `-Test` switch is on.
Clears the cache of the specific suite.

.PARAMETER Watch
Only works if `-Test` switch is on.
This watches the files included on specified tests.

.PARAMETER Database
Switch to run database operations.

.PARAMETER Initialize
Only works if `-Database` switch is on.
Switch to migrate all database tables for the first time.

.PARAMETER Upgrade
Only works if `-Database` switch is on.
Switch to migrate all database tables.

.PARAMETER Downgrade
Only works if `-Database` switch is on.
Switch to undo some migration of tables.

.PARAMETER Reset
Only works if `-Database` switch is on.
Switch to redo all migration of tables from the start.

.PARAMETER Seed
Only works if `-Database` switch is on.
Seeds the database with new values.

.PARAMETER Unseed
Only works if `-Database` switch is on.
Removes seeded values from last seeding.

.PARAMETER Reseed
Only works if `-Database` switch is on.
Redo the seeding of the database.

.PARAMETER Log
Generates changelog.

.INPUTS
All inputs are done through arguments.

.OUTPUTS
Depends on the command ran.

.EXAMPLE
PS> ./execute -help

Show the detailed help.

.EXAMPLE
PS> ./execute -test unit:front -watch

Runs the front-end unit tests.

.EXAMPLE
PS> ./execute -test -suitenames unit:server -watch

Runs and watches the server unit tests.
#>

Param(
	[Parameter(ParameterSetName="Help", Position=0)]
	[switch]
	$Help,

	[Parameter(ParameterSetName="Help", Position=1)]
	[switch]
	$Examples,

	[Parameter(ParameterSetName="Server", Position=0)]
	[switch]
	$Server,

	[Parameter(ParameterSetName="Server", Position=1)]
	[switch]
	$Normal,

	[Parameter(ParameterSetName="Server", Position=1)]
	[switch]
	$Prod,

	[Parameter(ParameterSetName="Server", Position=1)]
	[switch]
	$Routes,

	[Parameter(ParameterSetName="PushRepo", Position=0)]
	[switch]
	$Push,

	[Parameter(ParameterSetName="PullRepo", Position=0)]
	[switch]
	$Pull,

	[Parameter(ParameterSetName="PushRepo", Position=1)]
	[Parameter(ParameterSetName="PullRepo", Position=1)]
	[string]
	$Remote = "",

	[Parameter(ParameterSetName="Test", Position=0)]
	[switch]
	$Test,

	[Parameter(ParameterSetName="Test", Mandatory, Position=1)]
	[ValidateSet(
		"unit:share",
		"unit:front",
		"unit:ui",
		"unit:back",
		"unit:back_ci",
		"unit:front_ci",
		"unit:server",
		"unit:routes",
		"unit:database",
		"intg:front",
		"intg:back"
	)]
	[string]
	$SuiteName,

	[Parameter(ParameterSetName="Test", Position=2)]
	[string]
	$Regex = "",

	[Parameter(ParameterSetName="Test", Position=3)]
	[switch]
	$Clear,

	[Parameter(ParameterSetName="Test", Position=4)]
	[switch]
	$Watch,

	[Parameter(ParameterSetName="Database", Position=0)]
	[switch]
	$Database,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Initialize,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Upgrade,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Downgrade,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Reset,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Seed,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Unseed,

	[Parameter(ParameterSetName="Database", Position=1)]
	[switch]
	$Reseed,

	[Parameter(ParameterSetName="Log", Position=0)]
	[switch]
	$Log
)

if ($Help) {
	Get-Help $PSCommandPath -detailed
	if ($Examples) {
		Get-Help $PSCommandPath -examples
	}
}

if ($Server) {
	if ($Normal) {
		& npx ts-node ./server
	} elseif ($Prod) {
		& cross-env NODE_ENV=production npx ts-node ./server
	} elseif ($Routes) {
		& npx ts-node ./server/cli/list_routes.ts
	} else {
		$command = "pwsh ./execute.ps1 -Server -Normal"
		& npx nodemon --watch server --watch routes --watch database --watch common_back-end --ext ts --ignore "*.spec.ts" --exec "$command"
	}
}

if ($Test) {
	$type, $name = $SuiteName.Split(":")

	$configuration = "jest.$($name).$($type).config.json"
	if ($type -eq "unit") {
		$configuration = "jest.$($name).config.json"
	}

	$regexFlag = '""'
	if ($Regex -ne "") {
		$regexFlag = '"'+$Regex+'"'
	}

	if ($Clear) {
		$cacheDirectory = "t/cache/$($SuiteName.Replace(":", "_"))"

		Get-Item $cacheDirectory/* | ForEach-Object $_ {
			if ($_.Name -ne ".gitignore") {
				$NodeToDelete = "./$($cacheDirectory)/$($_.Name)"
				Write-Output "Deleting $NodeToDelete"
				Remove-Item $NodeToDelete -Recurse
			}
		}
	}

	if ($Watch) {
		if ($regexFlag -eq '""') {
			Write-Output "npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} $($watchFlag) --watch --detectOpenHandles"
			& npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --watch --detectOpenHandles
		} else {
			Write-Output "npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --testRegex $($regexFlag) --watch --detectOpenHandles"
			& npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --testRegex $($regexFlag) --watch --detectOpenHandles
		}
	} elseif ($regexFlag -eq '""') {
		Write-Output "npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --detectOpenHandles"
		& npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --detectOpenHandles
	} else {
		Write-Output "npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --testRegex $($regexFlag) --detectOpenHandles"
		& npx cross-env NODE_ENV=$($type)_test jest -c ${configuration} --testRegex $($regexFlag) --detectOpenHandles
	}
}

if ($Push) {
	$currentBranch = & git branch --show-current
	if ($Remote -eq "") {
		$Remote = "origin"
	}
	& git push -u $($Remote) $($currentBranch)
}

if ($Pull) {
	$outputFile = "hidden_cache_remote.txt"
	$command = ""
	$possibleOutput = ""
	$currentBranch = & git branch --show-current

	if ($Remote -eq "") {
		& git pull --prune
	} else {
		& git pull --prune $($Remote) $($currentBranch)
	}

	$possibleBranches = & git branch -l --format='%(refname:lstrip=2)'
	$possibleBranches = $possibleBranches -Split "`n"

	foreach($branch in $possibleBranches) {
		if ($branch -ne "master") {
			& git branch -d $branch.trim()
		}
	}
}

if ($Database) {
	if ($Initialize) {
		& npx sequelize-cli db:create
		& ./execute -Database -Upgrade
	}

	if ($Upgrade) {
		& npx sequelize-cli db:migrate
	}

	if ($Downgrade) {
		& npx sequelize-cli db:migrate:undo
	}

	if ($Reset) {
		& npx sequelize-cli db:drop
		& ./execute -Database -Initialize
	}

	if ($Seed) {
		& npx sequelize-cli db:seed:all
	}

	if ($Unseed) {
		& npx sequelize-cli db:seed:undo
	}

	if ($Reseed) {
		& npx sequelize-cli db:seed:undo:all
		& npx sequelize-cli db:seed:all
	}
}

if ($Log) {
	$packageConfiguration = Get-Content package.json | ConvertFrom-Json
	$version = $packageConfiguration.version.trimEnd("-dev")
	$previousVersion = [int32]($version.Split(".")[1]) - 1
	$nextVersion = [int32]($version.Split(".")[1]) + 1
	$packageConfiguration.version = "0.$([string]$nextVersion).0-dev"
	$packageConfiguration = ConvertTo-Json $packageConfiguration
	$packageConfiguration = $packageConfiguration.replace("  ", "	")
	Set-Content -Path package.json -Value $packageConfiguration

	$contents = & npx changelogen
	$contents = $contents.Trim("`n")
	$contents = $contents -Split "`n"
	$cleanedContents = @("# Changelog", "", "## v$version")

	$lastLine = "###"

	foreach($line in $contents) {
		$line = $line.
			Trim().
			Replace("≡ƒÜÇ", "🚀").
			Replace("ΓÜá∩╕Å", "⚠️").
			Replace("≡ƒ⌐╣", "🩹").
			Replace("≡ƒÆà", "💅").
			Replace("≡ƒôû", "📖").
			Replace("≡ƒÅí", "🏡").
			Replace("Γ£à", "✅").
			Replace("≡ƒÄ¿", "🎨").
			Replace("≡ƒñû", "🤖").
			Replace("≡ƒùÆ∩╕Å", "🗒️").
			Replace("≡ƒö⌐", "🔩").
			Replace("≡ƒîÉ", "🌐").
			Replace("≡ƒöª", "🔦").
			Replace("≡ƒªá", "🦠").
			Replace("≡ƒò╖", "🕷")
		if (($line -eq "") -and $lastLine.StartsWith("###")) {
			$lastLine = $line
		} elseif (($line -eq "" -and $lastLine -ne "") -or $line.StartsWith("-")) {
			$lastLine = $line
			$cleanedContents += $line
		} elseif ($line.StartsWith("###")) {
			$lastLine = $line
			$cleanedContents += $line
		}
	}

	$cleanedContents = $cleanedContents -join "`n"

	Rename-Item -Path ./changelogs/CHANGELOG.md -NewName CHANGELOG_v0.$($previousVersion).md
	Set-Content -Path changelogs/CHANGELOG.md -Value $cleanedContents
}

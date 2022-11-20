import {walk} from "https://deno.land/std@0.164.0/fs/walk.ts"
import rpmerge from "https://raw.githubusercontent.com/bitbloxhub/rpmerge/main/mod.ts"

async function runcommand(command: string) {
	const process = Deno.run({
		cmd: ["bash", "-c", command]
	})
	
	return await process.status()
}

async function downloadDep(name: string, type?: "datapack" | "resourcepack", local?: boolean, fname?: string) {
	if (name == "gm4") {
		await runcommand("git clone https://github.com/Gamemode4Dev/GM4_Datapacks")
		Deno.chdir("GM4_Datapacks")
		await runcommand("pip install -r requirements.txt")
		await runcommand("beet")
		for await (const file of walk("./out")) {
			if (file.isFile && file.name.endsWith(".zip")) {
				await runcommand(`cp ${file.path} ../cache/datapacks`)
			}
		}
		Deno.chdir("..")
		await runcommand("rm -rf GM4_Datapacks")
		await runcommand("git clone https://github.com/Gamemode4Dev/GM4_Resources")
		Deno.chdir("GM4_Resources")
		await runcommand("beet")
		for await (const file of walk("./out")) {
			if (file.isFile && file.name.endsWith(".zip")) {
				await runcommand(`cp ${file.path} ../cache/resourcepacks`)
			}
		}
		Deno.chdir("..")
		await runcommand("rm -rf GM4_Resources")
	} else if (name == "mechanization") {
		const mech = await (await fetch("https://github.com/ICY105/Mechanization/releases/download/4.0.4/MechanizationDatapack_v4.0.4.zip")).arrayBuffer()
		await Deno.writeFile("./cache/datapacks/mechanization.zip", new Uint8Array(mech))
		const mechrp = await (await fetch("https://github.com/ICY105/Mechanization/releases/download/4.0.4/MechanizationResourcepack_v4.0.4.zip")).arrayBuffer()
		await Deno.writeFile("./cache/resourcepacks/mechanization.zip", new Uint8Array(mechrp))
	} else if (name == "qcb") {
		const qcbdp = await (await fetch("https://github.com/Ellivers/QCB/releases/download/v1.0.0/QCB-Mergeable-DataPack.zip")).arrayBuffer()
		await Deno.writeFile("./cache/datapacks/qcb.zip", new Uint8Array(qcbdp))
		const qcbrp = await (await fetch("https://github.com/Ellivers/QCB/releases/download/v1.0.0/QCB-Mergeable-ResourcePack.zip")).arrayBuffer()
		await Deno.writeFile("./cache/resourcepacks/qcb.zip", new Uint8Array(qcbrp))
	} else if (name == "qcp") {
		const qcpdp = await (await fetch("https://github.com/TheNuclearNexus/QuietCustomPotion/releases/download/0.0.1/QCP_0.0.1_DP.zip")).arrayBuffer()
		await Deno.writeFile("./cache/datapacks/qcp.zip", new Uint8Array(qcpdp))
		const qcprp = await (await fetch("https://github.com/TheNuclearNexus/QuietCustomPotion/releases/download/0.0.1/QCP_0.0.1_RP.zip")).arrayBuffer()
		await Deno.writeFile("./cache/resourcepacks/qcp.zip", new Uint8Array(qcprp))
	} else if (name == "smithed") {
		await runcommand("git clone https://github.com/Smithed-MC/Libraries")
		Deno.chdir("Libraries")
		await runcommand("pip install bolt_expressions mecha")
		await runcommand("beet")
		for await (const file of walk("./dist")) {
			if (file.isFile && file.name.endsWith(".zip")) {
				if (file.name.endsWith("RP.zip")) {
					await runcommand(`cp ${file.path} ../cache/resourcepacks`)
				} else {
					await runcommand(`cp ${file.path} ../cache/datapacks`)
				}
			}
		}
	} else if (name == "playerdb") {
		const playerdb = await (await fetch("https://github.com/rx-modules/PlayerDB/releases/download/v2.0.2/PlayerDB.v2.0.2.zip")).arrayBuffer()
		await Deno.writeFile("./cache/datapacks/playerdb.zip", new Uint8Array(playerdb))
	} else if (name == "random") {
		const random = await (await fetch("https://github.com/Aeldrion/Minecraft-Random/releases/download/v1.0/Random.zip")).arrayBuffer()
		await Deno.writeFile("./cache/datapacks/random.zip", new Uint8Array(random))
	} else {
		let file: Uint8Array
		if (local) {
			file = await Deno.readFile(name)
		} else {
			file = new Uint8Array(await (await fetch(name)).arrayBuffer())
		}
		if (type == "resourcepack") {
			await Deno.writeFile(`./cache/resourcepacks/${fname}`, file)
		} else {
			await Deno.writeFile(`./cache/datapacks/${fname}`, file)
		}
	}
}

export default async function main() {
	await runcommand("rm -f resourcepack.zip datapack.zip")
	await Deno.chdir("datapack")
	await runcommand("zip -r ../datapack.zip .")
	await Deno.chdir("..")
	await Deno.chdir("resourcepack")
	await runcommand("zip -r ../resourcepack.zip .")
	await Deno.chdir("..")
}
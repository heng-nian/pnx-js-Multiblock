import { UUID } from 'java.util.UUID';
import { Server } from 'cn.nukkit.Server';
import { PowerNukkitX as pnx, EventPriority } from ':powernukkitx';
import { Item as JItem } from 'cn.nukkit.item.Item';//物品类
import { Block as JBlock } from 'cn.nukkit.block.Block';//方块类
import { Position as JPosition } from 'cn.nukkit.level.Position';//坐标类
import { CompoundTag as JCompoundTag } from "cn.nukkit.nbt.tag.CompoundTag";//tag
import { BlockEntity as JBlockEntity } from "cn.nukkit.blockentity.BlockEntity"
import { Utils as JUtils } from "cn.nukkit.utils.Utils"
// ------------------------------------------------
const server = Server.getInstance();
//-------------------------------隔离带~~=~=~-----------------------------------------
//这里是处理外面引入这个模块的方法 和自带的结构方法
import { structure } from "./structure/structure.js";
let structures = structure
export function admitStructure(name, data) {
	if (structures[name]) return false;
	return structures[name] = data;
}
let admitStructureBlock = {}
//-------------------------------隔离带~~=~=~-----------------------------------------
/**@return {Block}  java方块对象 @param {[x,y,z,level]} arg*/
function getBlock(...arg) { return new JPosition(...arg).getLevelBlock() }
/** 
 * @param {String} eventName
 * @param {Function} callback
 * @param {EventPriority} priority
*/
pnx.listen = function (eventName, callback = () => { }, priority = EventPriority.NORMAL) {
	pnx.listenEvent(eventName, priority,
		event => { if (!event.isCancelled()) callback(event) ? event.setCancelled() : null; });
}
function blcokIndex(b) { return [b.getLevel().getName(), b.getX(), b.getY(), b.getZ()].join(">") }
//------------------------------------------------------------------------
console.log(JUtils);
let structureData = JSON.parse(JUtils.readFile("./plugins/@Multiblock/data.json"));

console.log(structureData);



function admit(structures, subsidiary, data) {
	let { clickBlock, level } = subsidiary;
	let pos = new JPosition(
		clickBlock.getX() + structures.admit.pos.x,
		clickBlock.getY() + structures.admit.pos.y,
		clickBlock.getZ() + structures.admit.pos.z,
		level
	);

	console.log(pos.getX(), pos.getY(), pos.getZ());
	let admit = true;
	let admitBlock = {};
	for (let s = 0; s < structures.structure.length; s++) {
		let structure = structures.structure[s].split("")
		for (let is = 0; is < structure.length; is++) {
			let block = structures.blcok[structure[is]];
			if (block == "air") { pos.setX(pos.getX() + 1); continue; }
			if (block == "linefeed") {
				pos.setZ(pos.getZ() + 1);
				pos.setX(clickBlock.getX() + structures.admit.pos.x);
				continue
			}
			let levelBlock = pos.getLevelBlock();
			if (!block.equalsBlock(levelBlock)) { admit = false; admitBlock = {}; break; };
			admitBlock[blcokIndex(levelBlock)] = null;
			// console.log(pos.getX(), pos.getY(), pos.getZ());
			pos.setX(pos.getX() + 1);
		}
		pos.setY(pos.getY() - 1);
		pos.setZ(clickBlock.getZ() + structures.admit.pos.z);
		pos.setX(clickBlock.getX() + structures.admit.pos.x);
	}
	if (admit) {
		let uuid = UUID.randomUUID().toString()
		Object.assign(subsidiary, { uuid, admitBlock });
		structures.levelStructure[uuid] = {
			structuresPortotype: structures,
			subsidiary,
			data,
		};
		for (const value in admitBlock) admitBlock[value] = structures.levelStructure[uuid];
		structures.action.main(structures.levelStructure[uuid], subsidiary);
		Object.assign(admitStructureBlock, admitBlock);
		return true;
	}
	admitBlock = {};
}

export function main() {
	setInterval(() => {
		for (let i in structures) {
			for (let s in structures[i].levelStructure) {
				structures[i].action.tick(structures[i].levelStructure[s])
			}
		}
	}, 50);


	for (let i in structureData) {
		for (let s in structureData[i]) {
			let data = s.split(">")
			let level = server.getLevelByName(data[0]);
			let clickBlock = getBlock(Number(data[1]), Number(data[2]), Number(data[3]), level);
			// console.log(server.getOnlinePlayers().values(), clickBlock);
			admit(structures[i], { clickBlock, level, structureName: i }, structureData[i][s]);
		}
	}










	pnx.listen("cn.nukkit.event.player.PlayerInteractEvent", event => {
		if (event.getAction().name() != "RIGHT_CLICK_BLOCK") return;
		let player = event.getPlayer();//玩家
		let playerInventory = player.getInventory();//玩家物品栏
		let clickBlock = event.getBlock();//点击的方块
		let level = clickBlock.getLevel();//世界类

		for (let i in structures) {
			//物品是否点击正确
			let retell = admitStructureBlock[blcokIndex(clickBlock)]
			if (retell) {
				retell.structuresPortotype.action.click(event,retell);
				break;
			}
			if (structures[i].admit.item && !structures[i].admit.item.equals(playerInventory.getItemInHand())) continue;


			if (admit(structures[i], { player, clickBlock, playerInventory, level, structureName: i }, {
				playerName: player.getName(),
				xuid: player.getLoginChainData().getXUID()
			})) break;
		}




		let block = event.getBlock();
		let meta = {
			name: block.getName(),
			id: block.getId(),
			data: block.getDataStorage(),
			pos: { x: block.getX(), y: block.getY(), z: block.getZ() },
			level: block.getLevel(),
		}

		// event.getPlayer().sendMessage(JSON.stringify(meta, (key, value) => {
		// 	if (key == "level") return value.getName()
		// 	return value
		// }, 2))
		// console.log(meta);
	})
	pnx.listen("cn.nukkit.event.block.BlockBreakEvent", blockEvent);
	pnx.listen("cn.nukkit.event.block.BlockBurnEvent", blockEvent);
	pnx.listen("cn.nukkit.event.block.BlockExplodeEvent", blockEvent);
	function blockEvent(event) {
		let block = event.getBlock()
		let retell = admitStructureBlock[blcokIndex(block)]
		if (!retell) return;
		retell.structuresPortotype.action.destruction(retell, event?.getPlayer());
		// console.log(retell.subsidiary.admitBlock);
		for (let i in retell.subsidiary.admitBlock) {
			delete admitStructureBlock[i]
		}
		// console.log(structureData[retell.subsidiary.structureName][blcokIndex(retell.subsidiary.clickBlock)]);
		delete structureData[retell.subsidiary.structureName][blcokIndex(retell.subsidiary.clickBlock)]
		console.log(structureData);
		delete retell.structuresPortotype.levelStructure[retell.subsidiary.uuid];
		// structureData
		// console.log(retell.structuresPortotype.levelStructure);
	}
	console.log("JS plugin start");

}

export function close() {
	//在这里写关闭后保存？
	// structureData
	for (let i in structures) {
		for (let s in structures[i].levelStructure) {
			if (!structureData[i]) structureData[i] = {};
			let data = structures[i].levelStructure[s]
			let index = blcokIndex(data.subsidiary.clickBlock);
			structureData[i][index] = data.data
			console.log(structureData);
		}
	}
	JUtils.writeFile("./plugins/@Multiblock/data.json", JSON.stringify(structureData));
	print("JS plugin close");
}
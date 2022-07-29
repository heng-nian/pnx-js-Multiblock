import { Item as JItem } from 'cn.nukkit.item.Item';//物品类
import { Block as JBlock } from 'cn.nukkit.block.Block';//方块类
let altar = {
    name: "祭坛",
    blcok: {
        o: JBlock.get(5, 0),
        b: JBlock.get(5, 2),
        " ": "air",
        ",": "linefeed"
    },
    admit: {
        item: new JItem(374, 0, 12),//点击所使用的物品
        pos: { x: -1, y: 0, z: -1 },//点击的方块坐标回归到结构左上角的差值
    },
    structure: [
        "bb ,bo ,  o",
        "ooo,ooo,ooo"
    ],
    action: {
        //structure 为玩家创建该结构后 此结构的专属储存对象
        // subsidiary 临时存储类 此属性只在第一次结构被创建时有效 当服务器重启时将会是部分缺失的 
        //当无 subsidiary.player 属性时 表示为后续重启的自动创建
        //structure.data 里为长期存储的json类型数据
        main: function (structure, subsidiary) {//创建结构时第一次执行的初始函数
            if (!subsidiary.player) return;
            console.log(["玩家", subsidiary.player.getName(), "创建了祭坛"].join(" "));
        },
        tick: function (structure) {//每tick 该结构所做的
            // console.log("tick",structure.subsidiary.player.getName());
        },
        destruction: function (structure, player) {//结构被破坏时
            if (player) console.log("玩家", player.getName(), "干的");
            console.log("结构", structure.structuresPortotype.name, "被破坏了");
        },
        click: function (event,retell) {
            console.log("玩家",event.getPlayer().getName(),"点击了这个结构");
        },
        plugin: {},
    },
    levelStructure: {}
}


export { altar };
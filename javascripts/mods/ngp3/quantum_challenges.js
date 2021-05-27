let QCs = {
	setup() {
		QCs.save = {
			in: [],
			comps: 0,
			best: {}
		}
		return QCs.save
	},
	compile() {
		QCs.save = {}
		if (tmp.ngp3 && tmp.qu !== undefined) {
			QCs.save = tmp.qu.qc
			if (QCs.save === undefined) tmp.qu.qc = this.setup()
		}
		if (QCs.save.qc1 === undefined) QCs.reset()
		QCs.updateTmp()
	},
	reset() {
		QCs.save.qc1 = {boosts: 0, max: 0}
		QCs.save.qc2 = [0, 0]
		QCs.save.qc3 = undefined
		QCs.save.qc4 = undefined
		QCs.save.qc5 = undefined
		QCs.save.qc6 = new Decimal(1) //Best-in-this-quantum replicantis
		QCs.save.qc7 = 0
		QCs.save.qc8 = undefined //Same as QC5
	},
	data: {
		max: 8,
		1: {
			unl: () => true,
			desc: () => "Replicated Galaxies are replaced with Replicated Boosts.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "You can keep Replicated Boosts, but the requirements and limits are much higher.",
			rewardEff(str) {
				return 1
			},

			updateTmp() {
				delete QCs.tmp.qc1
				if (!QCs.in(1) && !QCs.done(1)) return

				let boosts = QCs.save.qc1.boosts
				let maxBoosts = QCs.save.qc1.max

				QCs.tmp.qc1 = {
					req: new Decimal("1e10000000"),
					maxLimit: new Decimal("1e1000000000"),

					expSpeed: Math.max(1 / (boosts / 10 + 1), 0.5),
					expMult: Math.min(boosts / 10 + 1, 2),
					slowdown: Math.pow(2, boosts),
					maxBonus: maxBoosts / 10 + Math.max(boosts - 10, 0) / 10,
				}
			},

			can: () => player.replicanti.amount.gte(QCs.tmp.qc1.req) && ph.can("eternity") && QCs.save.qc1.boosts < 10,
			boost() {
				if (!QCs.data[1].can()) return false

				eternity(true)
				QCs.save.qc1.boosts++
				return true
			}
		},
		2: {
			unl: () => true,
			desc: () => "You must exclude one type of galaxy for non-dilation and dilation runs. Changing the exclusion requires a forced Eternity reset.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "Tachyonic Galaxies timelapse Replicantis by " + timeDisplay(x * 10) + " each.",
			rewardEff(str) {
				return 0.1
			}
		},
		3: {
			unl: () => true,
			desc: () => "There are only Meta Dimensions, but they also produce antimatter. Mastery Studies are extremely cheaper.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "Replicantis, meta-antimatter, and dilated time have gradually stronger boosts to each other.",
			rewardEff(str) {
				return Math.sqrt(player.replicanti.amount.max(1).log10()) * player.dilation.dilatedTime.max(1).log10() * player.meta.bestAntimatter.max(1).log10()
			}
		},
		4: {
			unl: () => true,
			desc: () => "All Quantum effects never work except Positronic Boosters, but replaced.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "Entangled Boosters increase the maximum percentage of sacrificed galaxies. Currently: " + formatPercentage(x) + "%",
			rewardEff(str) {
				return 0.25
			}
		},
		5: {
			unl: () => true,
			desc: () => "There is a product which divides Meta Dimensions based on Dimension Boosts and Galaxies. You can't also set the limit of the autobuyer of Dimension Boosts.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "The Positron conversion formula is better. Currently: +" + formatPercentage(x - 1) + "%",
			rewardEff(str) {
				return 1
			}
		},
		6: {
			unl: () => true,
			desc: () => "The effect of Replicantis is inversedly exponential.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "Extra Replicated Galaxies contribute to Positrons for QEM replacement.",
			rewardEff(str) {
				return str
			}
		},
		7: {
			unl: () => true,
			desc: () => "You can gain Tachyon Particles up to 5 dilation runs. Mastery Studies are reset.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "Weaken the cost superscaling for 4th repeatable dilation upgrade. Currently: ^2 -> ^" + x.toFixed(3),
			rewardEff(str) {
				return 1.25
			}
		},
		8: {
			unl: () => true,
			desc: () => "QC5, but you can't change the exclusion.",
			goal: () => false,
			goalDisp: () => "(not balanced yet)",
			goalMA: new Decimal(1),
			rewardDesc: (x) => "Reduce the slowdown point for 2nd repeatable dilation upgrade. Currently: 1.35 -> " + x.toFixed(4),
			rewardEff(str) {
				return 1.35
			}
		},
	},
	tmp: {},

	updateTmp() {
		let data = { unl: [], in: [], rewards: {} }
		QCs.tmp = data

		if (!QCs.unl()) return
		for (let x = 1; x <= QCs.data.max; x++) {
			if (QCs.data[x].unl()) {
				if (QCs.save.in.includes(x)) data.in.push(x)
				data.unl.push(x)
				if (!QCs.done(x)) break
			}
		}

		QCs.updateTmpOnTick()
	},
	updateTmpOnTick() {
		if (!QCs.unl()) return
		
		let data = QCs.tmp
		for (let x = 1; x <= QCs.data.max; x++) {
			if (data.unl.includes(x)) {
				data.rewards[x] = QCs.data[x].rewardEff(1)
			}
			if (QCs.data[x].updateTmp) QCs.data[x].updateTmp()
		}
	},

	unl() {
		return tmp.quActive && masteryStudies.has("d8") && QCs.save !== undefined
	},
	in(x) {
		return QCs.tmp.in.includes(x)
	},
	inAny() {
		return QCs.tmp.in.length >= 1
	},
	done(x) {
		return QCs.unl() && QCs.save.comps >= x
	},
	isRewardOn(x) {
		return QCs.done(x) && QCs.tmp.rewards[x]
	},
	getGoal() {
		return QCs.in.length >= 2 ? true : QCs.data[QCs.tmp.in[0]].goal()
	},
	getGoalDisp() {
		return QCs.in.length >= 2 ? "" : " and " + QCs.data[QCs.tmp.in[0]].goalDisp()
	},
	getGoalMA() {
		return QCs.data[QCs.tmp.in[0]].goalMA
	},

	tp() {
		showTab("challenges")
		showChallengesTab("quantumchallenges")
	},
	start(x) {
		quantum(false, true, x)
	},

	setupDiv() {
		if (QCs.divInserted) return

		let html = ""
		for (let x = 1; x <= QCs.data.max; x++) html += (x % 2 == 1 ? "<tr>" : "") + QCs.divTemp(x) + ((x + 1) % 2 == 1 ? "</tr>" : "")
		getEl("qcs_div").innerHTML = html

		QCs.divInserted = true
	},
	divTemp: (x) =>
		'<td><div class="quantumchallengediv" id="qc_' + x + '_div">' +
		'<span id="qc_' + x + '_desc"></span><br><br>' +
		'<div class="outer"><button id="qc_' + x + '_btn" class="challengesbtn" onclick="QCs.start(' + x + ')">Start</button><br>' +
		'Goal: <span id="qc_' + x + '_goal"></span><br>' +
		'Reward: <span id="qc_' + x + '_reward"></span>' +
		'</div></div></td>',
	divInserted: false,

	updateDisp() {
		//Quantum Challenges
		let unl = QCs.divInserted && QCs.unl()
		if (!unl) return

		for (let qc = 1; qc <= QCs.data.max; qc++) {
			var cUnl = QCs.tmp.unl.includes(qc)

			getEl("qc_" + qc + "_div").style.display = cUnl ? "" : "none"
			if (cUnl) {
				getEl("qc_" + qc + "_desc").textContent = QCs.data[qc].desc()
				getEl("qc_" + qc + "_goal").textContent = shorten(QCs.data[qc].goalMA) + " meta-antimatter and " + QCs.data[qc].goalDisp()
				getEl("qc_" + qc + "_btn").textContent = QCs.in(qc) ? "Running" : QCs.done(qc) ? "Completed" : "Start"
				getEl("qc_" + qc + "_btn").className = QCs.in(qc) ? "onchallengebtn" : QCs.done(qc) ? "completedchallengesbtn" : "challengesbtn"
			}
		}

		//In Quantum Challenges
		getEl("replicantiBoost").style.display = QCs.tmp.qc1 ? "" : "none"

		//Paired Challenges
		/*
		assigned = []
		var assignedNums = {}
		getEl("pairedchallenges").style.display = player.masterystudies.includes("d9") ? "" : "none"
		getEl("respecPC").style.display = player.masterystudies.includes("d9") ? "" : "none"
		for (var pc = 1; pc <= 4; pc++) {
			var subChalls = tmp.qu.pairedChallenges.order[pc]
			if (subChalls) for (var sc = 0; sc < 2; sc++) {
				var subChall = subChalls[sc]
				if (subChall) {
					assigned.push(subChall)
					assignedNums[subChall] = pc
				}
			}
			if (player.masterystudies.includes("d9")) {
				var property = "pc" + pc
				var sc1 = tmp.qu.pairedChallenges.order[pc] ? tmp.qu.pairedChallenges.order[pc][0] : 0
				var sc2 = (sc1 ? tmp.qu.pairedChallenges.order[pc].length > 1 : false) ? tmp.qu.pairedChallenges.order[pc][1] : 0
				getEl(property+"desc").textContent = "Paired Challenge "+pc+": Both Quantum Challenge " + (sc1 ? sc1 : "?") + " and " + (sc2 ? sc2 : "?") + " are applied."
				getEl(property+"cost").textContent = "Cost: Still none. ;/"
				getEl(property+"goal").textContent = "Goal: " + (sc2 ? shortenCosts(Decimal.pow(10, QCs.getGoalMA(subChalls))) : "???") + " antimatter"
				getEl(property).textContent = pcFocus == pc ? "Cancel" : (tmp.qu.pairedChallenges.order[pc] ? tmp.qu.pairedChallenges.order[pc].length < 2 : true) ? "Assign" : tmp.qu.pairedChallenges.current == pc ? "Running" : tmp.qu.pairedChallenges.completed >= pc ? "Completed" : tmp.qu.pairedChallenges.completed + 1 < pc ? "Locked" : "Start"
				getEl(property).className = pcFocus == pc || (tmp.qu.pairedChallenges.order[pc] ? tmp.qu.pairedChallenges.order[pc].length < 2 : true) ? "challengesbtn" : tmp.qu.pairedChallenges.completed >= pc ? "completedchallengesbtn" : tmp.qu.pairedChallenges.completed + 1 <pc ? "lockedchallengesbtn" : tmp.qu.pairedChallenges.current == pc ? "onchallengebtn" : "challengesbtn"

				var sc1t = Math.min(sc1, sc2)
				var sc2t = Math.max(sc1, sc2)
				if (player.masterystudies.includes("d14")) {
					getEl(property + "br").style.display = ""
					getEl(property + "br").textContent = sc1t != 6 || sc2t != 8 ? "QC6 & 8" : tmp.qu.bigRip.active ? "Big Ripped" : tmp.qu.pairedChallenges.completed + 1 < pc ? "Locked" : "Big Rip"
					getEl(property + "br").className = sc1t != 6 || sc2t != 8 ? "lockedchallengesbtn" : tmp.qu.bigRip.active ? "onchallengebtn" : tmp.qu.pairedChallenges.completed + 1 < pc ? "lockedchallengesbtn" : "bigripbtn"
				} else getEl(property + "br").style.display = "none"
			}
		}
		*/

		//Big Rip
		getEl("bigrip").style.display = player.masterystudies.includes("d14") ? "" : "none"
		if (masteryStudies.has("d14")) {
			var max = getMaxBigRipUpgrades()
			getEl("spaceShards").textContent = shortenDimensions(tmp.qu.bigRip.spaceShards)
			for (var u = 18; u <= 20; u++) getEl("bigripupg" + u).parentElement.style.display = u > max ? "none" : ""
			for (var u = 1; u <= max; u++) {
				getEl("bigripupg" + u).className = tmp.qu.bigRip.upgrades.includes(u) ? "gluonupgradebought bigrip" + (isBigRipUpgradeActive(u, true) ? "" : "off") : tmp.qu.bigRip.spaceShards.lt(bigRipUpgCosts[u]) ? "gluonupgrade unavailablebtn" : "gluonupgrade bigrip"
				getEl("bigripupg" + u + "cost").textContent = shortenDimensions(new Decimal(bigRipUpgCosts[u]))
			}
		}
	},
	updateDispOnTick() {
		if (!QCs.divInserted) return

		for (let qc = 1; qc <= QCs.data.max; qc++) {
			if (QCs.tmp.unl.includes(qc)) getEl("qc_" + qc + "_reward").textContent = QCs.data[qc].rewardDesc(QCs.tmp.rewards[qc])
		}
	},
	updateBest() {
		//Rework coming soon
	}
}
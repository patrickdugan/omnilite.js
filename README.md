# omnilite.js
.js rebuild of OmniLayer implementation for Litecoin

Folks, we lost a lot of time to C++

But that is not this day... this day, we use C++ only to parse blocks!

Liberated, the .js implementation of Omni-style protocol for OP_Return Defi opens a *new era* of Bitcoin and Litecoin (and Dogecoin?) DeFi.

We don't even have to put these payloads in OP_Return anymore we can use Segwit like Ordinals do or we can put them, in the future, 
inside MAST structures alongside ZK proofs to further future-proof this style of consensus-layering. AIs understand .js, 
they can't work with a giant Bitcoin adjunct C++ program. And neither can most devs these days.

Let's leave Bitcoin C++ Core implementation as a conservative thing, it gets 1 new feature every 5 years and it churns throughput on the relayer network or RPC services.

Then, we can have .js compatible blockchains run this code in ZK proofed forms and those forms can interop with other DeFi!

It's truly amazing the roadmap that this .js port can lead to.

Let's collaborate to make it happen.


Key Concept 1: Refactoring tx types

We're going to have a meta transaction to create a new tx type, and it will assign a serial integer to that tx. 
I have no solution to the problem of people spamming junk tokens or junk tx types. Just filter and curate at app level.

The implementation of a tx type in javascript is dramatically easier. To facilitate this, we will have a concept of the consensus hash that is modular.

In this manner we avoid the need for multisig activation protocols and hard deadlines. The tallyMap updates caused by these tx are real even if the tx is,
for example, buggy in some way, freezing assets in some loop, or a wallet draining scam. Once a tx is published, it's shipped, it's history. It's not great for testing.

But you know what? The whole, oh there's this product with >1B TLV but the devs still have admin push rights to certain sub-contracts that call the public interface...
it's not decentralized folks.

We can't fit a bunch of code in OP_Return but we sure can in the SegWit. Ordinals were a nice step (we'll avoid the awkward colored coin aspect with its numismatic UTXOs).

Key Concept 2: object oriented programming maybe

We will have a superclass called Protocol that subordinates all the files and all their functions, so everything is imminently accessible.

Key Concept 3: time machine consensus

We will rethink the parsing a little bit. Now that we have decoupled consensus building from real-time block i/o of a full node, 
let's have the consensus update on a step basis. On each step the deltas are recorded and indexed. Everything is comprehensively auditable.

Remember in about 2007 when Apple rolled out a Mac OS update with a time machine function? That's maybe over engineered because they retired it later, but...
maybe we should? Because...

Key Concept 4: nuanced indexing

I had a 2 hour chat with Rick Dudley last December and it didn't lead to any transactions but it did, as usual, teach me invaluable insights into the infrastructure
of the computer science we call web 3. The problem of indexing on Ethereum is manifest and involves specialization and its own indexer infrastructure, 
which Vulcanize has been building. The ability to index Bitcoin in a ZK proof has been the subject of the ZeroSync project, which has made some progress (and which I
made some preceeding contribution and R&D in collaboration with another couple of devs, but ultimately they're much smarter/better devs/genius compared to us, to be honest).

What this all amounts to is that we can think about indices of deltas. Deltas on payments. Deltas on trades. Deltas of STO. etc. We index the tallymap by block but also:
we have an index of state updates for each property; tx type history; and insurance or socialization i/o function. 

This helps to audit features on test ecosystem or run apps and services. Complex features like derivatives clearing involve a lot of moving parts and it was tough in C++.

Furthermore the nuanced indexing allows for more efficient lookups and most of all, for proofing these indivual state details for further app development, interop!

Additionally some sprucing up of things like TallyMap to be more self-auditable and safe.

Key Concept 5: blocks only

The first files are an extractor that loops, takes its time, and makes a tx index based on reading for OP_Return payloads with markers. There's a tallymap refactor draft, 
and a parsing.js that needs work to get to a prototype. All of the consensus is manufactured based on the index.

Key Concept 6: dynamic consensus handshaking

We have all the libraries in the universe in C++ Bitcoin and even easier to plug in in .js, to be establishing channels with people and streaming websockets of consensus hash,
then confirming consensus. We can make this a tool for debugging the revamped activation/rules/modular consensus.

Roadmap to Prototype:

1) prototype block parser; Done
2) port in byteshift operations for making payloads and reading them; in progress
3) refactor tallyMap; Draft
4) refactor consensusFunction; Draft
5) port in encoding, parsing of sender and ref. addresses
6) port in token issuance tx, token list/functions
7) port in simple Send

Basic testing
8) basic consensus port in and handshake
9) port in metadex
10) use LevelDB.js to replace all LevelDB indexing functions
11) port in RPC
12) port in persistence

New Features:

13...N - add new features with brittle consensus

Implement refactor concepts

a) superclass
b) indexed consensus
c) tx issuer tx
d) test consensus failsafe mode
e) add bespoke indexing
f) put index creation code execution under zk proof system

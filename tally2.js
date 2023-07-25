class TallyMap {
  constructor(propertyId) {
    this.propertyId = propertyId;
    this.addresses = new Map();
    this.index = TallyMap.getIndex(propertyId);
    this.feeCache = 0;
    TallyMap.registerInstance(this);
  }

  static getIndex(propertyId) {
    if (!TallyMap.index) {
      TallyMap.index = new Map();
    }
    if (!TallyMap.index.has(propertyId)) {
      TallyMap.index.set(propertyId, new Map());
    }
    return TallyMap.index.get(propertyId);
  }

  updateAvailableBalance(address, amount) {
    const addressObj = this.getOrCreateAddress(address);
    addressObj.available += amount;
    this.updateFeeCache(-amount);
  }

  updateOrderReservedBalance(address, amount) {
    const addressObj = this.getOrCreateAddress(address);
    addressObj.orderReserved += amount;
    this.updateFeeCache(-amount);
  }

  updateCommittedBalance(address, amount) {
    const addressObj = this.getOrCreateAddress(address);
    addressObj.committed += amount;
    this.updateFeeCache(-amount);
  }

  updateMarginBalance(address, amount) {
    const addressObj = this.getOrCreateAddress(address);
    addressObj.margin += amount;
    this.updateFeeCache(-amount);
  }

  updateFeeCache(amount) {
    this.feeCache += amount;
  }

  getOrCreateAddress(address) {
    if (!this.addresses.has(address)) {
      const newAddress = {
        string: address,
        available: 0,
        orderReserved: 0,
        committed: 0,
        margin: 0,
        propertyId: this.propertyId,
      };
      this.addresses.set(address, newAddress);
    }
    return this.addresses.get(address);
  }

  totalTokens() {
    let total = 0;
    for (const addressObj of this.addresses.values()) {
      total +=
        addressObj.available +
        addressObj.orderReserved +
        addressObj.committed +
        addressObj.margin;
    }
    return total;
  }

  static registerInstance(instance) {
    // Maintain an array or object to store all the instances
    // For example, using an array:
    if (!TallyMap.instances) {
      TallyMap.instances = [];
    }
    TallyMap.instances.push(instance);
  }

  static lookupInstancesByAddress(address) {
    // Lookup all the instances that have a matching address
    if (!TallyMap.instances) {
      return [];
    }
    return TallyMap.instances.filter((instance) => instance.address === address);
  }

  static getAddressBalances(address) {
    const balances = [];
    for (const tallyMapIndex of TallyMap.index.values()) {
      for (const tallyMap of tallyMapIndex.values()) {
        if (tallyMap.addresses.has(address)) {
          const addressObj = tallyMap.addresses.get(address);
          balances.push({
            propertyId: tallyMap.propertyId,
            available: addressObj.available,
            orderReserved: addressObj.orderReserved,
            committed: addressObj.committed,
            margin: addressObj.margin,
          });
        }
      }
    }
    return balances;
  }
}



// Example usage
const tallyMap1 = new TallyMap(1);
tallyMap1.updateAvailableBalance('address1', 100);
tallyMap1.updateOrderReservedBalance('address2', 50);

const tallyMap2 = new TallyMap(2);
tallyMap2.updateAvailableBalance('address1', 200);
tallyMap2.updateCommittedBalance('address2', 70);

console.log('Address Balances:', TallyMap.getAddressBalances('address1'));
class ChainedPromise extends Promise {
  constructor(executor = (resolve) => resolve()) {
    let resolver, rejecter;
    super((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
      if (typeof executor === "function") {
        try {
          executor(resolve, reject);
        } catch (error) {
          reject(error);
        }
      }
    });

    this._resolve = resolver;
    this._reject = rejecter;
  }

  chain(executor) {
    return new this.constructor((resolve, reject) => {
      this.then((value) => {
        try {
          resolve(executor(value));
        } catch (err) {
          reject(err);
        }
      }).catch(reject);
    });
  }

  resolve(value) {
    if (this._resolve) {
      this._resolve(value);
    } else {
      throw new Error("Promise has already been settled.");
    }
    return this;
  }

  reject(reason) {
    if (this._reject) {
      this._reject(reason);
    } else {
      throw new Error("Promise has already been settled.");
    }
    return this;
  }

  static resolve(value) {
    return new this((resolve) => resolve(value));
  }

  static reject(reason) {
    return new this((_, reject) => reject(reason));
  }
}

module.exports = ChainedPromise;

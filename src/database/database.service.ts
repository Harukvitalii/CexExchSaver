import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Record } from './record.model';
import { Exchange } from './exchange.model';
import { LoggingService } from 'src/logger/logging.service';

@Injectable()
export class DatabaseService {
  constructor(
    private readonly logger: LoggingService,
    @InjectModel(Exchange)
    private exchangeModel: typeof Exchange,

    @InjectModel(Record)
    private recordnModel: typeof Record,
  ) {
    // User.sync({force: true})
    // .then(() => console.log('Users table synced'))
    // .catch((error) => console.error('Error creating users table:', error));
    // Address.sync()
    // .then(() => console.log('Contract table synced'))
    // .catch((error) => console.error('Error creating contracts table:', error));
  }

  async findAllAddresses(): Promise<Address[]> {
    return this.addressModel.findAll();
  }
  async findAllTransactions(): Promise<Transaction[]> {
    return Transaction.findAll();
  }
  async findOneUser(user_id: number): Promise<User> {
    return User.findOne({
      where: { user_id: user_id },
    });
  }

  async saveNewAddress(address: Address): Promise<Address> {
    const walletAddress = address.address;
    try {
      const addr = await address.save();
      return addr;
    } catch (error) {
      this.logger.log(`error sa address ${walletAddress}, err: ${error.name}`);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const existingAddress = await Address.findOne({
          where: { address: address.address },
        });
        return existingAddress;
      } else {
        return error.name;
      }
    }
  }

  async saveNewTransaction(trans: Transaction): Promise<Transaction> {
    try {
      const tr = trans.save();
      return tr;
      //     transactionHash: trans.transactionHash,
      //     from: trans.from,
      //     to: trans.to,
      //     isAvailable: trans.isAvailable,
      //   });
      //   await transaction.save();
      //   return transaction;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const existingTrans = await this.transactionModel.findOne({
          where: { transactionHash: trans.transactionHash },
        });
        return existingTrans;
      } else {
        return error.name;
      }
    }
  }

  async saveNewUser(user: User): Promise<User> {
    try {
      const u = user.save();
      return u;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const existingUser = await this.userModel.findOne({
          where: { user_id: user.user_id },
        });
        return existingUser;
      } else {
        return error.name;
      }
    }
  }
}

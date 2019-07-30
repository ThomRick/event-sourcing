import { IApplicable } from './applicable.interface';
import { IEvent } from './event.interface';

export abstract class RootEvent implements IEvent {
  public abstract name: string;

  public apply(applicable: IApplicable): IApplicable {
    return applicable.apply(this);
  }
}

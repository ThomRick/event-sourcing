import { IEvent } from '@thomrick/event-sourcing';
import {
  BasicCredentials,
  ICredentials,
  IUserId,
  UserCreated,
  UserLoggedIn,
  UserLoggedOut,
  UUIDUserId,
  WrongCredentialsException,
} from '../../../00-common';
import { ProjectionUserAggregate } from './projection-user.aggregate';

describe('ProjectionUserAggregate', () => {
  const id: IUserId = UUIDUserId.create();
  const credentials: ICredentials = new BasicCredentials('email', 'password', 'username');

  it('should create and log in a new user', () => {
    const aggregate = new ProjectionUserAggregate(id, credentials);

    expect(aggregate.projection.id).toEqual(id);
    expect(aggregate.projection.credentials).toEqual(credentials);
    expect(aggregate.projection.logged).toBeTruthy();

    const changes: IEvent[] = aggregate.uncommittedChanges;
    expect(changes).toContainEqual(new UserCreated(id, credentials));
    expect(changes).toContainEqual(new UserLoggedIn(id));
  });

  it('should rebuild the aggregate from events', () => {
    const events: IEvent[] = [
      new UserCreated(id, credentials),
      new UserLoggedIn(id),
      new UserLoggedOut(id),
    ];

    const aggregate = new ProjectionUserAggregate().rebuild(events);

    expect(aggregate.projection.id).toEqual(id);
    expect(aggregate.projection.credentials).toEqual(credentials);
    expect(aggregate.projection.logged).toBeFalsy();
  });

  it('should log out the user', () => {
    const aggregate = new ProjectionUserAggregate().rebuild([
      new UserCreated(id, credentials),
      new UserLoggedIn(id),
    ]);

    aggregate.logOut();

    expect(aggregate.projection.logged).toBeFalsy();
    expect(aggregate.uncommittedChanges).toContainEqual(new UserLoggedOut(id));
  });

  it('should log in the user', () => {
    const aggregate = new ProjectionUserAggregate().rebuild([
      new UserCreated(id, credentials),
    ]);

    aggregate.logIn(credentials);

    expect(aggregate.projection.logged).toBeTruthy();
    expect(aggregate.uncommittedChanges).toContainEqual(new UserLoggedIn(id));
  });

  it('should throw a wrong credentials exception', () => {
    const aggregate = new ProjectionUserAggregate().rebuild([
      new UserCreated(id, credentials),
    ]);

    expect(
      () => aggregate.logIn(new BasicCredentials('email', 'wrongPassword', 'username')),
    )
    .toThrow(WrongCredentialsException);
  });
});

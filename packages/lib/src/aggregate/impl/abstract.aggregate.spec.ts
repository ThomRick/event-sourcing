import { IEvent } from '../../event';
import { TestAggregate, TestCreated, TestFailed, TestStarted, TestState, TestSucceed } from './utils.spec';

describe('AbstractAggregate', () => {
  const id: string = 'test';
  it('should create a new test', () => {
    // GIVEN
    // WHEN
    const aggregate = new TestAggregate(id);
    // THEN
    expect(aggregate.id).toEqual(id);
    expect(aggregate.state).toEqual(TestState.READY);
  });

  it('should add a test created event', () => {
    // GIVEN
    // WHEN
    const aggregate = new TestAggregate(id);
    // THEN
    expect(aggregate.uncommittedChanges).toContainEqual(new TestCreated(id));
  });

  it('should run the test', () => {
    // GIVEN
    const aggregate = new TestAggregate(id);
    // WHEN
    aggregate.run();
    // THEN
    expect(aggregate.state).toEqual(TestState.RUNNING);
  });

  it('should add a test started event', () => {
    // GIVEN
    const aggregate = new TestAggregate(id);
    // WHEN
    aggregate.run();
    // THEN
    expect(aggregate.uncommittedChanges).toContainEqual(new TestStarted(id));
  });

  it('should success the test', () => {
    // GIVEN
    const aggregate = new TestAggregate(id);
    aggregate.run();
    // WHEN
    aggregate.success();
    // THEN
    expect(aggregate.state).toEqual(TestState.SUCCESS);
  });

  it('should add a test succeed event', () => {
    // GIVEN
    const aggregate = new TestAggregate(id);
    aggregate.run();
    // WHEN
    aggregate.success();
    // THEN
    expect(aggregate.uncommittedChanges).toContainEqual(new TestSucceed(id));
  });

  it('should fail the test', () => {
    // GIVEN
    const aggregate = new TestAggregate(id);
    aggregate.run();
    // WHEN
    aggregate.fail();
    // THEN
    expect(aggregate.state).toEqual(TestState.FAIL);
  });

  it('should add a test failed event', () => {
    // GIVEN
    const aggregate = new TestAggregate(id);
    aggregate.run();
    // WHEN
    aggregate.fail();
    // THEN
    expect(aggregate.uncommittedChanges).toContainEqual(new TestFailed(id));
  });

  it('should rebuild the aggregate from events', () => {
    // GIVEN
    const events: IEvent[] = [
      new TestCreated(id),
      new TestStarted(id),
      new TestSucceed(id),
    ];
    // WHEN
    const aggregate = new TestAggregate().rebuild(events);
    // THEN
    expect(aggregate.id).toEqual(id);
    expect(aggregate.state).toEqual(TestState.SUCCESS);
  });
});

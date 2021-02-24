export class Container {
    Id: string;
}

export class ContainerDetails {
    Id: string;
    State: State;
    Name: string;
}
export class State {
    Status: STATE_STATUS;
    Health: Health;
    Error: string;
}
export class Health {
    Status: HEALTH_STATUS;
    FailingStreak: number;
    Log: Log[];
}

export class Log {
    Start: Date;
    End: Date;
    ExitCode: number;
    Output: string;
}

export enum HEALTH_STATUS {
    healthy='healthy', unhealthy='unhealthy'
}

export enum STATE_STATUS {
    running, ready, exited, stopped
}
declare namespace validate {
    interface Results {
        validForNewPackages: boolean;
        validForOldPackages: boolean;
        errors?: string[] | undefined;
        warnings?: string[] | undefined;
    }

    interface ValidNames extends Results {
        validForNewPackages: true;
        validForOldPackages: true;
    }

    interface InvalidNames extends Results {
        validForNewPackages: false;
        validForOldPackages: false;
        errors: string[];
    }

    interface LegacyNames extends Results {
        validForNewPackages: false;
        validForOldPackages: true;
        warnings: string[];
    }
}

declare function validate(name: string): validate.ValidNames | validate.InvalidNames | validate.LegacyNames;
declare function fixName(name: string): string;

export = {validate, fixName};

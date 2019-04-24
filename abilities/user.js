const casl = require('@casl/ability');
function defineAbilityForUser() {
    const { AbilityBuilder, Ability } = casl;
    const { rules, can, cannot } = AbilityBuilder.extract()

    can(['rate', 'getAll', 'getOwn', 'updateStatus', 'getById'], 'books');
    cannot(['delete', 'add', 'update'], 'books');

    can(['getAll', 'getById'], 'author');
    cannot(['delete', 'add', 'update'], 'author');

    can(['getAll'], 'category');
    cannot(['delete', 'add', 'update'], 'category');

    can(['getInfo', 'update', 'updatePassword', 'updatePhoto', 'delete', 'create'], 'user');

    return new Ability(rules)
}

module.exports = defineAbilityForUser;
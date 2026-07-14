create index if not exists crm_activities_assignment_idx on crm_activities(assignment_id);
create index if not exists crm_assignments_experiment_idx on crm_assignments(experiment_id);
create index if not exists crm_experiments_play_idx on crm_experiments(play_code);

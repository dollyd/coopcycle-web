<?php

namespace AppBundle\Doctrine\EventSubscriber\TaskSubscriber;

use AppBundle\Entity\Task;
use AppBundle\Entity\TaskList;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Security\Core\User\UserInterface;

class TaskListProvider
{
    private $objectManager;
    private $taskListRepository;
    private $taskListCache = [];

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        $this->taskListRepository = $objectManager->getRepository(TaskList::class);
    }

    public function getTaskList(Task $task, UserInterface $courier)
    {
        $date = $task->getDoneBefore();

        $taskListCacheKey = sprintf('%s-%s', $date->format('Y-m-d'), $courier->getUsername());

        if (!isset($this->taskListCache[$taskListCacheKey])) {

            $taskList = $this->taskListRepository->findOneBy([
                'date' => $date,
                'courier' => $courier,
            ]);

            if (!$taskList) {
                $taskList = new TaskList();
                $taskList->setDate($date);
                $taskList->setCourier($courier);

                $this->objectManager->persist($taskList);
            }

            $this->taskListCache[$taskListCacheKey] = $taskList;
        }

        return $this->taskListCache[$taskListCacheKey];
    }
}

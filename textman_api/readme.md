[Start server]
To start a Uvicorn server run following command:
>>>    ./start.sh
or simply run:
>>>    bash start.sh


[Input Data format]
The input data format is like a list of dicts:
>>>    {
          widgets: [
                    {id: '12453553', text: 'I want'},
                    {id: '12459063', text: 'be splitted'},
                    {id: '15436262', text: 'by textman!'},
                ],
          count_groups: 5
        }

[Output Data format]
The output data format is like a list of lists with id's of clusters.
For example, if 1st and 3d elements in one cluster, and the 2d one in another one,
then the output data will be:
>>>     [
            ['12453553', '15436262'],
            ['12459063']
        ]


'''
    --Materials--
    # https://mljar.com/blog/visualize-decision-tree/
    # https://github.com/wywongbd/autocluster
    # https://towardsdatascience.com/applying-machine-learning-to-classify-an-unsupervised-text-document-e7bb6265f52
    # https://machinelearningmastery.com/clustering-algorithms-with-python/
    # https://radimrehurek.com/gensim/auto_examples/tutorials/run_summarization.html
    # https://habr.com/ru/post/322034/
https://ai-news.ru/2020/03/chto_takoe_embeddingi_i_kak_oni_pomogaut_mashinam_ponimat_teksty.html
https://habr.com/ru/post/321216/

'''